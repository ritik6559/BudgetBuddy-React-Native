import * as React from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Card from "./ui/Card";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useSQLiteContext } from "expo-sqlite";
import { Category, Transaction } from "../types";

export default function AddTransaction({
    insertTransaction,
}: {
    insertTransaction(transaction: Transaction): Promise<void>;
}) {
    const [isAddingTransaction, setIsAddingTransaction] =
        React.useState<boolean>(false);
    const [currentTab, setCurrentTab] = React.useState<number>(0);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [typeSelected, setTypeSelected] = React.useState<string>("");
    const [amount, setAmount] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");
    const [category, setCategory] = React.useState<string>("Expense");
    const [categoryId, setCategoryId] = React.useState<number>(1);
    const db = useSQLiteContext();

    React.useEffect(() => {
        getExpenseType(currentTab);
    }, [currentTab]);

    async function getExpenseType(currentTab: number) {
        setCategory(currentTab === 0 ? "Expense" : "Income");
        const type = currentTab === 0 ? "Expense" : "Income";

        const result = await db.getAllAsync<Category>(
            `SELECT * FROM Categories WHERE type = ?;`,
            [type]
        );
        setCategories(result);
    }

    async function handleSave() {
        try {

            const now = new Date();
            const transactionData = {
                amount: Number(amount),
                description,
                category_id: categoryId,
                date: Math.floor(Date.now() / 1000), // Current Unix timestamp in seconds
                type: category as "Expense" | "Income",
            };

            console.log('Saving transaction:', transactionData);

            // @ts-ignore
            await insertTransaction({
                amount: Number(amount),
                description,
                category_id: categoryId,
                // Convert to timestamp - using getTime() gives milliseconds, so divide by 1000 for seconds
                date: Math.floor(now.getTime()),  // Remove the /1000 to keep millisecond precision
                type: category as "Expense" | "Income",
            });

            // Reset form after successful save
            setAmount("");
            setDescription("");
            setCategory("Expense");
            setCategoryId(1);
            setCurrentTab(0);
            setIsAddingTransaction(false);
        } catch (error) {
            console.error('Error saving transaction:', error);
            // You might want to add error handling here, like showing a toast notification
        }
    }

    return (
        <View style={{ marginBottom: 15 }}>
            {isAddingTransaction ? (
                <View>
                    <Card>
                        <TextInput
                            placeholder="$Amount"
                            style={{ fontSize: 32, marginBottom: 15, fontWeight: "bold" }}
                            keyboardType="numeric"
                            onChangeText={(text) => {
                                // Remove any non-numeric characters before setting the state
                                const numericValue = text.replace(/[^0-9.]/g, "");
                                setAmount(numericValue);
                            }}
                        />
                        <TextInput
                            placeholder="Description"
                            style={{ marginBottom: 15 }}
                            onChangeText={setDescription}
                        />
                        <Text style={{ marginBottom: 6 }}>Select a entry type</Text>
                        <SegmentedControl
                            values={["Expense", "Income"]}
                            style={{ marginBottom: 15 }}
                            selectedIndex={currentTab}
                            onChange={(event) => {
                                setCurrentTab(event.nativeEvent.selectedSegmentIndex);
                            }}
                        />
                        {categories.map((cat) => (
                            <CategoryButton
                                key={cat.name}
                                // @ts-ignore
                                id={cat.id}
                                title={cat.name}
                                isSelected={typeSelected === cat.name}
                                setTypeSelected={setTypeSelected}
                                setCategoryId={setCategoryId}
                            />
                        ))}
                    </Card>
                    <View
                        style={{ flexDirection: "row", justifyContent: "space-around" }}
                    >
                        <Button
                            title="Cancel"
                            color="red"
                            onPress={() => setIsAddingTransaction(false)}
                        />
                        <Button title="Save" onPress={handleSave} />
                    </View>
                </View>
            ) : (
                <AddButton setIsAddingTransaction={setIsAddingTransaction} />
            )}
        </View>
    );
}

function CategoryButton({
    id,
    title,
    isSelected,
    setTypeSelected,
    setCategoryId,
}: {
    id: number;
    title: string;
    isSelected: boolean;
    setTypeSelected: React.Dispatch<React.SetStateAction<string>>;
    setCategoryId: React.Dispatch<React.SetStateAction<number>>;
}) {
    return (
        <TouchableOpacity
            onPress={() => {
                setTypeSelected(title);
                setCategoryId(id);
            }}
            activeOpacity={0.6}
            style={{
                height: 40,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isSelected ? "#007BFF20" : "#00000020",
                borderRadius: 15,
                marginBottom: 6,
            }}
        >
            <Text
                style={{
                    fontWeight: "700",
                    color: isSelected ? "#007BFF" : "#000000",
                    marginLeft: 5,
                }}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}

function AddButton({
    setIsAddingTransaction,
}: {
    setIsAddingTransaction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    return (
        <TouchableOpacity
            onPress={() => setIsAddingTransaction(true)}
            activeOpacity={0.6}
            style={{
                height: 40,
                flexDirection: "row",
                alignItems: "center",

                justifyContent: "center",
                backgroundColor: "#007BFF20",
                borderRadius: 15,
            }}
        >
            <MaterialIcons name="add-circle-outline" size={24} color="#007BFF" />
            <Text style={{ fontWeight: "700", color: "#007BFF", marginLeft: 5 }}>
                New Entry
            </Text>
        </TouchableOpacity>
    );
}