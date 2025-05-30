export interface ManagerTransaction {
    id: number,
    type: string,
    amount: number,
    date: Date,
    description: string,
    users_id: number
}