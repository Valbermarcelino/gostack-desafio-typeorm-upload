import { getCustomRepository } from 'typeorm'; 

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute( id: string ): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionRepository.findOne({
      where: { id: id },
    });

    if(transaction) {
        throw new AppError('Transaction not found.', 401);
    }

    transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
