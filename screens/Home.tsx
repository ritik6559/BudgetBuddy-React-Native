import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Category, Transaction } from '../types';
import { useSQLiteContext } from 'expo-sqlite';
import TransactionList from '../components/TransactionList';

const Home = () => {


    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const db = useSQLiteContext();

    useEffect(() => {
        db.withTransactionAsync(async () => {
            await getData();
        });
    }, []);

    async function getData() {
        const result = await db.getAllAsync<Transaction>('SELECT * FROM Transactions ORDER BY date DESC;');
        setTransactions(result);


        const categoriesResult = await db.getAllAsync<Category>('SELECT * FROM Categories;');
        setCategories(categoriesResult);
    }


    async function deleteTransaction(id: number) {
        db.withTransactionAsync(async () => {
            await db.runAsync('DELETE FROM Transactions WHERE id = ?;', [id]);
            await getData();

        })
    }

    return (
        <View>
            <ScrollView contentContainerStyle={{
                padding: 15,
            }}>
                <TransactionList
                    categories={categories}
                    transactions={transactions}
                    deleteTransaction={deleteTransaction}
                />

            </ScrollView>
        </View>
    )
}

export default Home

const styles = StyleSheet.create({})