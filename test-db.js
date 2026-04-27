import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing categories...');
  const { data: catData, error: catError } = await supabase.from('categories').select('*').limit(1);
  console.log('Categories:', catError ? catError : 'OK', catData?.length);

  console.log('Testing transactions...');
  const { data: txData, error: txError } = await supabase.from('transactions').select('*').limit(1);
  console.log('Transactions:', txError ? txError : 'OK', txData?.length);

  console.log('Testing insertion mock...');
  const { data: insData, error: insError } = await supabase.from('transactions').insert([{
    id: '00000000-0000-0000-0000-000000000000',
    type: 'expense',
    amount: 10,
    description: 'TEST',
    category: 'TEST',
    date: '2023-01-01',
    status: 'completed'
  }]);
  console.log('Insert:', insError ? insError : 'OK');
}

test();
