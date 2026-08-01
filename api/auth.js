export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { action, username, password } = req.body;
    const dbUrl = "https://mmdproj-1b37b-default-rtdb.firebaseio.com";
    const usernameClean = username ? username.toLowerCase() : '';

    try {
        // ۱. ثبت نام کاربر
        if (action === 'register') {
            const checkUser = await fetch(`${dbUrl}/users/${usernameClean}.json`);
            const existingData = await checkUser.json();

            if (existingData) {
                return res.status(400).json({ message: 'این نام کاربری قبلاً ثبت نام کرده است.' });
            }

            // ذخیره کاربر جدید
            await fetch(`${dbUrl}/users/${usernameClean}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    createdAt: new Date().toISOString()
                })
            });

            return res.status(200).json({ success: true });
        }

        // ۲. ورود کاربر
        if (action === 'login') {
            const checkUser = await fetch(`${dbUrl}/users/${usernameClean}.json`);
            const userData = await checkUser.json();

            if (!userData) {
                return res.status(400).json({ message: 'نام کاربری وجود ندارد' });
            }

            if (userData.password !== password) {
                return res.status(400).json({ message: 'رمز اشتباه هست' });
            }

            return res.status(200).json({ success: true, username: userData.username });
        }

        // ۳. ورود مدیر
        if (action === 'adminLogin') {
            if (usernameClean === "fizonorg" && password === "1234") {
                return res.status(200).json({ success: true });
            }

            const checkAdmin = await fetch(`${dbUrl}/adminConfig.json`);
            const adminData = await checkAdmin.json();

            if (adminData && adminData.username && adminData.username.toLowerCase() === usernameClean && adminData.password === password) {
                return res.status(200).json({ success: true });
            }

            return res.status(400).json({ message: 'نام کاربری یا رمز عبور مدیریت اشتباه است.' });
        }

        return res.status(400).json({ message: 'دستور نامعتبر است' });

    } catch (error) {
        return res.status(500).json({ message: 'خطای سرور: ' + error.message });
    }
}
