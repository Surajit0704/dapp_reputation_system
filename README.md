# 🌟 Decentralized Reputation System (Soroban Smart Contract)

A fully permissionless, on-chain reputation system built using **Soroban SDK (Stellar)**.
This smart contract allows users to assign and track reputation scores between addresses in a transparent and decentralized manner.

---

## 📌 Project Overview

This project implements a **peer-to-peer reputation mechanism** where:

* Any user can give reputation to another user
* Reputation is permanently stored on-chain
* The system tracks:

  * Total reputation received
  * Total reputation given
  * Pairwise reputation (who gave whom)

---

## 🚀 Features

✅ **Permissionless Voting**
Anyone can give reputation to any address

✅ **Transparent Tracking**
All reputation data is stored on-chain

✅ **Three-Level Data Tracking**

* Total reputation received by a user
* Total reputation given by a user
* Reputation exchanged between two users

✅ **Secure Authentication**

* Only the sender (`from`) can authorize giving reputation

---

## 🧠 Smart Contract Functions

### 🔹 `give_rep(from, to, amount)`

Give reputation to another address

* Requires authentication from `from`
* Ensures:

  * Amount > 0
  * Cannot give reputation to self

---

### 🔹 `get_rep(address)`

Returns total reputation received by an address

---

### 🔹 `get_given_rep(address)`

Returns total reputation given by an address

---

### 🔹 `get_vote(from, to)`

Returns reputation given from one address to another

---

## 🗂️ Data Storage Structure

The contract uses persistent storage with the following keys:

```rust
Reputations → Map<Address, i128>
GivenRep    → Map<Address, i128>
Votes       → Map<(Address, Address), i128>
```

---

## ⚙️ Tech Stack

* **Language:** Rust
* **Blockchain:** Stellar (Soroban)
* **SDK:** soroban-sdk
* **Storage:** Persistent contract storage

---

## 🧪 How It Works

1. User A gives reputation to User B
2. Contract updates:

   * B’s total reputation
   * A’s total given reputation
   * Vote record between A → B
3. Data is stored permanently on-chain

---

## 📦 Deployment

> Add your deployed contract link here

```
Deployed Contract: [CAWUF2KUORQMH2RQFQLFGGWPC6WXXID3PEGYZPQAHGW7EN5A4Z4L5MBL]
```
![image alt](https://github.com/Surajit0704/dapp_reputation_system/blob/ebefa379712217238a425888c6c7853ff9cef267/Screenshot%202026-03-20%20152942.png)
![image alt](https://github.com/Surajit0704/dapp_reputation_system/blob/cdfc7ffd7f0e0b8823b025f6261d0df63dfac033/Screenshot%202026-03-20%20154027.png)

---

## 🛠️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/dapp_reputation_system.git
cd dapp_reputation_system
```

### 2. Build the contract

```bash
stellar contract build
```

### 3. Run tests

```bash
cargo test
```

---

## 🔐 Security Considerations

* Prevents self-reputation
* Requires authentication for actions
* Ensures only valid (positive) reputation values

---

## 💡 Future Improvements

* Reputation decay over time
* Anti-spam / rate limiting
* Weighted reputation system
* Integration with frontend dashboard
* DAO-based governance

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

## 👨‍💻 Author

**Surajit Ghosh**

* GitHub: https://github.com/Surajit0704

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

