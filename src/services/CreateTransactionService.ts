import { getRepository } from 'typeorm'; 

import  AppError from '../errors/AppError';

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
    const transactionRepository = getRepository(Transaction);

    const checkCategoryExists = await transactionRepository.findOne({
        where: { category },
    });

    if (checkCategoryExists) { //****cadastrar nova categoria e retornar id*/
      const categoryRepository = getRepository(Category);
      const newCategory = categoryRepository.create({
        title: category,
      })

      await categoryRepository.save(newCategory);

      checkCategoryExists.category_id = newCategory.id;
    }

    //const category_id = category; /***acertar - newCategory.id*/

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: checkCategoryExists?.category_id,  //ver depois********
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
