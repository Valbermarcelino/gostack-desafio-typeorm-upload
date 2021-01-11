import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';

class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {
    async function loadCSV(filePath: string): Transaction[] {
      const readCSVStream = fs.createReadStream(csvFilePath);

      const parseStream = csvParse({ 
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });
      
      const parseCSV = readCSVStream.pipe(parseStream);

      const lines: Transaction[] = [];

      parseCSV.on('data', line => {
        lines.push(line);
      });
      
      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });
      
      return lines;
    }

    const csvFilePath = path.resolve(__dirname, '..', '..', 'import_template.csv');

    const data = loadCSV(csvFilePath);
  }
}

export default ImportTransactionsService;
