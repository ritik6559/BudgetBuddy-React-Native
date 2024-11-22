import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Category, Transaction } from '../types'


interface TransactionListItemProps {
    transaction: Transaction;
    categoryInfo: Category | undefined
}

const TransactionListItem = ({ transaction, categoryInfo }: TransactionListItemProps) => {
  return (
    <View>
      <Text>{transaction.description} amount: {transaction.amount}</Text>
    </View>
  )
}

export default TransactionListItem

