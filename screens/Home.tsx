import { ScrollView, StyleSheet, Text, TextStyle, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Category, Transaction, TransactionsByMonth } from '../types';
import { useSQLiteContext } from 'expo-sqlite';
import TransactionList from '../components/TransactionList';
import Card from '../components/ui/Card';

const Home = () => {


    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionsByMonth, setTransactionsByMonth] = useState<TransactionsByMonth>({
        totalExpenses: 0,
        totalIncome: 0,
    });

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



        const now = new Date();

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

        const startOfMonthTimestamp = Math.floor(startOfMonth.getTime() / 1000);
        const endOfMonthTimestamp = Math.floor(endOfMonth.getTime() / 100);

        const transactionByMonth = await db.getAllAsync<TransactionsByMonth>(`
            SELECT
                COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
                COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS totalIncome,
            FROM Transactions
            WHERE date >= ? AND date <= ?
        `, [startOfMonthTimestamp, endOfMonthTimestamp]);
        setTransactionsByMonth(transactionByMonth[0],)
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
                <TransactionSummary totalExpenses={transactionsByMonth.totalExpenses} totalIncome={transactionsByMonth.totalIncome} />
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

function TransactionSummary({ totalIncome, totalExpenses }: TransactionsByMonth) {
    const savings = totalIncome - totalExpenses;
    const readablePeriod = new Date().toLocaleString("default", {
        month: 'long',
        year: 'numeric'
    });

    const getMoneyTextStyle = (value: number): TextStyle => ({
        fontWeight: "bold",
        color: value < 0 ? "#ff4500" : "#2e8b57"
    });

    const formatMoney = (value: number) => {
        const absValue = Math.abs(value).toFixed(2);
        return `${value < 0 ? "-" : ""}$${absValue}`;
    };



    return (
        <Card style={styles.container}>
            <Text style={styles.periodTitle}>Summary for {readablePeriod}</Text>
            <Text style={styles.summaryText}>
                Income:{" "}
                <Text style={getMoneyTextStyle(totalIncome)}>
                    {formatMoney(totalIncome)}
                </Text>
            </Text>
            <Text style={styles.summaryText}>
                Total Expenses:{" "}
                <Text style={getMoneyTextStyle(totalExpenses)}>
                    {formatMoney(totalExpenses)}
                </Text>
            </Text>
            <Text style={styles.summaryText}>
                Savings:{" "}
                <Text style={getMoneyTextStyle(savings)}>{formatMoney(savings)}</Text>
            </Text>
        </Card>
    )

}



const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        paddingBottom: 7,
    },
    blur: {
        width: "100%",
        height: 110,
        position: "absolute",
        bottom: 0,
        borderTopWidth: 1,
        borderTopColor: "#00000010",
        padding: 16,
    },
    periodTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    summaryText: {
        fontSize: 18,
        color: "#333",
        marginBottom: 10,
    },
    // Removed moneyText style since we're now generating it dynamically
});