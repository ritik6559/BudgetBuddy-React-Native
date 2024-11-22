import { TouchableOpacity } from "react-native";
import { Category, Transaction } from "../types"
import { View, Text } from "react-native";
import TransactionListItem from "./TransactionListItem";

export default function ({
    transactions,
    categories,
    deleteTransaction,
}: {
    categories: Category[],
    transactions: Transaction[],
    deleteTransaction: (id: number) => Promise<void>;
}) {

    return (
        <View>
            {
                transactions.map((transaction) => {
                    const categoryForCurrentItem = categories.find(
                        (category) => category.id === transaction.category_id
                    )
                    return (
                        <TouchableOpacity
                            key={transaction.id}
                            activeOpacity={.7}
                            onLongPress={() => deleteTransaction(transaction.id)}
                        >
                            <TransactionListItem transaction={transaction} categoryInfo={categoryForCurrentItem} />
                            
                        </TouchableOpacity>
                    )
                }
                )
            }
        </View>
    )

} 