const db = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function seed() {
    await db.authenticate();
    await db.sync(); // Ensure tables exist

    const email = 'admin@example.com';
    const password = 'password123';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const [user, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                password: hashedPassword,
                role: 'super-admin',
                isAdmin: true
            }
        });

        if (created) {
            console.log('Admin user created:', email, password);
        } else {
            console.log('Admin user already exists');
            // Update password just in case
            user.password = hashedPassword;
            user.role = 'super-admin';
            user.isAdmin = true;
            await user.save();
            console.log('Admin user updated');
        }
    } catch (e) {
        console.error('Seeding error:', e);
    } finally {
        process.exit();
    }
}

seed();
