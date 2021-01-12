import csvParse from 'csv-parse';
import fs from 'fs'; // file sistem - le arquivo, abre, ...
import { getCustomRepository, getRepository, In } from 'typeorm'; // In vai verificar se as categorias existem no banco de uma vez só

import Category from '../models/Category';
import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const catergoriesRepository = getRepository(Category);

    const readCSVStream = fs.createReadStream(filePath); // requisição

    // configuração
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    // array pra receber dados
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    // carrega dados no array
    parseCSV.on('data', async line => {
      // data é o nome do evento só
      const [
        title,
        type,
        value,
        category,
      ] /* desestruturando */ = line.map((cell: string) => cell.trim());

      if (!title || !type || !value) return; // se algum não existir para aqui

      categories.push(category);

      // pegamos array com linhas de [ title, type, value , category ] e transformar num vetor de transactions
      transactions.push({ title, type, value, category });
    });

    // lê o fim
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // ##fazendo o esquema de cadastrar tudo de uma vez só

    // achando em massa todas as categorias
    const existentCategories = await catergoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    // pegando só os titulos
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    // categorias q não estão no banco

    const addCategoryTitles = categories
      .filter(
        category => !existentCategoriesTitles.includes(category), // retorna todas q não forem radical
      )
      .filter((value, index, self) => self.indexOf(value) === index); // tirando duplicadas - vai buscar o index em q o valor é igual e vai tirar pelo filter

    const newCategories = catergoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    ); // vai fazer um varios objetos : { title: "Food" }, { title: "Radical" },...

    await catergoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTrasactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(createdTrasactions);

    await fs.promises.unlink(filePath);

    return createdTrasactions;
    // console.log(addCategoryTitles);
    // console.log(transactions);
  }
}

export default ImportTransactionsService;
