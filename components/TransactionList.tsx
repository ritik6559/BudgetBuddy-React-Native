import { TouchableOpacity } from "react-native";
import { Category, Transaction } from "../types"
import { View, Text } from "react-native";

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
                    return (
                        <TouchableOpacity
                            key={transaction.id}
                            activeOpacity={.7}
                            onLongPress={() => deleteTransaction(transaction.id)}
                        >
                            <Text>
                                {transaction.description} amount: {transaction.amount}
                            </Text>
                            
                        </TouchableOpacity>
                    )
                }
                )
            }
        </View>
    )

} 