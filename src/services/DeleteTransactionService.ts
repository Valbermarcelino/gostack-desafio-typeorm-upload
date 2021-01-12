import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionRepository.findOne({
      where: { id },
    });

    // const transaction = await transactionRepository.findOne(id); pode ser assim tbm

    if (!transaction) {
      throw new AppError('Transaction not found.', 401);
    }

    await transactionRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
