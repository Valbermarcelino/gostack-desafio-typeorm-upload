import { getCustomRepository, getRepository } from 'typeorm'; 

import  AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string,
  type: 'income' | 'outcome',
  value: number,
  category: string,
}

class CreateTransactionService {
  public async execute({ title, type, value, category  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository); //getCustomRepository é pq a gente ta usando um repositorio q a gnt criou
    const categoryRepository = getRepository(Category);

    let transactionCategory = await categoryRepository.findOne({
        where: { title: category },
    });

    if (!transactionCategory) { //**** se não existir cadastrar nova categoria e retornar id*/
        transactionCategory = categoryRepository.create({
          title: category,
        });

        await categoryRepository.save(transactionCategory); 
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category: transactionCategory, 
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
