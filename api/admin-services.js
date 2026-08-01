export default async function handler(req, res) {
    const dbUrl = "https://mmdproj-1b37b-default-rtdb.firebaseio.com";

    // درخواست‌های GET
    if (req.method === 'GET') {
        const { action, username } = req.query;

        try {
            // ۱. دریافت لیست محصولات
            if (action === 'getProducts') {
                const firebaseRes = await fetch(`${dbUrl}/products.json`);
                const data = await firebaseRes.json();
                return res.status(200).json(data || {});
            }

            // ۲. دریافت لیست کاربران ثبت نامی
            if (action === 'getUsers') {
                const firebaseRes = await fetch(`${dbUrl}/users.json`);
                const data = await firebaseRes.json();
                return res.status(200).json(data || {});
            }

            // ۳. دریافت تنظیمات مدیر
            if (action === 'getAdminConfig') {
                const firebaseRes = await fetch(`${dbUrl}/adminConfig.json`);
                const data = await firebaseRes.json();
                return res.status(200).json(data || {});
            }

            // ۴. دریافت لیست چت‌ها
            if (action === 'getChatList') {
                const firebaseRes = await fetch(`${dbUrl}/chatList.json`);
                const data = await firebaseRes.json();
                return res.status(200).json(data || {});
            }

            // ۵. دریافت پیام‌های یک گفتگو
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
        const { action, id, productData, configData, username, text } = req.body;

        try {
            // افزودن یا ویرایش محصول
            if (action === 'saveProduct' && productData) {
                if (id) {
                    await fetch(`${dbUrl}/products/${id}.json`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(productData)
                    });
                } else {
                    await fetch(`${dbUrl}/products.json`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(productData)
                    });
                }
                return res.status(200).json({ success: true });
            }

            // حذف محصول
            if (action === 'deleteProduct' && id) {
                await fetch(`${dbUrl}/products/${id}.json`, {
                    method: 'DELETE'
                });
                return res.status(200).json({ success: true });
            }

            // ذخیره تنظیمات مدیریت
            if (action === 'saveAdminSettings' && configData) {
                await fetch(`${dbUrl}/adminConfig.json`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(configData)
                });
                return res.status(200).json({ success: true });
            }

            // ارسال پاسخ مدیر در چت
            if (action === 'sendAdminReply' && username && text) {
                const userClean = username.toLowerCase();
                await fetch(`${dbUrl}/chats/${userClean}.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sender: 'admin',
                        text: text,
                        timestamp: new Date().toISOString()
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
