# 🧑‍💻 Daily Git Workflow (Developer Checklist)

> ❗ **Rule:** কেউ সরাসরি `main or Development` branch-এ কাজ করবে না
> সব কাজ হবে **নিজের assigned branch** থেকে

---

## ✅ 1️⃣ First Day Setup (একবারই লাগবে)

### 🔹 Repo clone করো

```bash
git clone https://github.com/rezaulrht/chat-app-server.git
cd chat-app-server
```

### 🔹 নিজের branch এ যাও

```bash
git checkout your_brach_name
```

### 🔹 নিশ্চিত হও remote ঠিক আছে

```bash
git branch
```

👉 তোমার branch এর পাশে `*` থাকবে

---

## 🔄 2️⃣ প্রতিদিন কাজ শুরু করার আগে (MANDATORY)

```bash
git checkout Development
git pull origin Development
git checkout your_brach_name
git merge Development
```

✔ এতে তুমি latest code দিয়ে কাজ শুরু করবে
❌ এটা skip করলে conflict হবে

---

## 🛠️ 3️⃣ Development (কাজ করার সময়)

* শুধু নিজের feature এ কাজ করো
* অন্যের file unnecessarily touch করো না
* Frequent small commits করো

---

## 💾 4️⃣ Commit করার নিয়ম (প্রতিদিন)

### 🔹 File status দেখো

```bash
git status
```

### 🔹 Changes add করো

```bash
git add .
```

### 🔹 Meaningful commit দাও

```bash
e.g: git commit -m "Add responsive navbar"
```

📌 Commit message rules:

* Present tense
* Short & clear
* Example:

  * `Fix login bug`
  * `Add footer section`
  * `Update theme colors`

---

## ⬆️ 5️⃣ Branch push করো

```bash
git push origin your_brach_name
```

---

## 🔁 6️⃣ Pull Request (PR) তৈরি করো

GitHub এ গিয়ে:

* Base branch → `Development`
* Compare branch → `your_brach_name`
* PR description এ লেখো:

  * কী কাজ করছো
  * কোন file change

⛔ **নিজে নিজে merge করবে না**

---

## 🧑‍⚖️ 7️⃣ Review & Merge (Team Lead / Owner)

* Code review
* Conflict check
* Approved হলে → **Merge**

---

## 🔄 8️⃣ PR Merge এর পর (MANDATORY)

```bash
git checkout main
git pull origin main
git checkout your_brach_name
git merge main
```

✔ তোমার branch আবার clean & updated

---

## 🔁 9️⃣ Next Task Start

```bash
# repeat from step 2
```

---

## 🚨 Important Rules (Must Follow)

✔ Daily work start করার আগে `merge main`
✔ Small & frequent commits
✔ Clear commit message

❌ `main or Development` এ direct push
❌ Large single commit
❌ Merge না করে PR

---

## 🧠 Conflict এ পড়লে কী করবে?

1. Conflicted file খুলবে
2. `<<<<<<<` `=======` `>>>>>>>` resolve করবে
3. তারপর:

```bash
git add .
git commit -m "Resolve merge conflict"
```

---

## 🟩 One-Line Summary

```
Update Development → Merge to my branch → Work → Commit → Push → PR → Merge → Repeat
```
