import { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import { getCustomRepository } from 'typeorm';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
//const transactionsRepository = new TransactionsRepository();

transactionsRouter.get('/', async (request, response) => {
  //const transactions = transactionsRepository.all();
  const transactionsRepository = getCustomRepository(TransactionsRepository); //***

  const transactions = await transactionsRepository.find(); //find sem nada pega todo o repositorio
  const balance = await transactionsRepository.getBalance();

  return response.json({ 
    transactions, 
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
      title,
      type,
      value,
      category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
