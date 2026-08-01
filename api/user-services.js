export default async function handler(req, res) {
    const dbUrl = "https://mmdproj-1b37b-default-rtdb.firebaseio.com";

    // درخواست‌های GET
    if (req.method === 'GET') {
        const { action, username } = req.query;

        try {
            // ۱. دریافت اطلاعات تماس مدیریت
            if (action === 'getAdminConfig') {
                const firebaseRes = await fetch(`${dbUrl}/adminConfig.json`);
                const data = await firebaseRes.json();
                return res.status(200).json(data || {});
            }

            // ۲. دریافت لیست محصولات
            if (action === 'getProducts') {
                const firebaseRes = await fetch(`${dbUrl}/products.json`);
                const data = await firebaseRes.json();
                return res.status(200).json(data || {});
            }

            // ۳. دریافت پیام‌های چت کاربر
            if (action === 'getChatMessages' && username) {
                const userClean = username.toLowerCase();
                const firebaseRes = await fetch(`${dbUrl}/chats/${userClean}.json`);
                const data = await firebaseRes.json();
                return res.status(200).json(data || {});
            }

            return res.status(400).json({ message: 'Action نامعتبر است' });
        } catch (error) {
            return res.status(500).json({ message: 'خطای سرور: ' + error.message });
        }
    }

    // درخواست‌های POST
    if (req.method === 'POST') {
        const { action, username, text } = req.body;

        try {
            // ارسال پیام چت پشتیبانی
            if (action === 'sendChatMessage' && username && text) {
                const userClean = username.toLowerCase();

                // ثبت پیام در chats
                await fetch(`${dbUrl}/chats/${userClean}.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sender: username,
                        text: text,
                        timestamp: new Date().toISOString()
                    })
                });

                // آپدیت لیست چت‌های فعال برای مدیر
                await fetch(`${dbUrl}/chatList/${userClean}.json`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: username,
                        lastUpdate: new Date().toISOString()
                    })
                });

                return res.status(200).json({ success: true });
            }

            return res.status(400).json({ message: 'تنظیمات نامعتبر است' });
        } catch (error) {
            return res.status(500).json({ message: 'خطای سرور: ' + error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
