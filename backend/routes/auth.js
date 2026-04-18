const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin"); // 1. Admin model lazmi add karein
const auth = require("../middleware/authMiddleware");

// --- GET CURRENT USER (/me) ---
router.get("/me", auth, async (req, res) => {
  try {
    // Pehle Admin check karein
    let account = await Admin.findById(req.user.id).select("-password");
    let role = 'admin';

    // Agar Admin nahi hai, toh User check karein
    if (!account) {
      account = await User.findById(req.user.id).select("-password");
      role = 'user';
    }

    if (!account) return res.status(404).json({ msg: "User not found" });

    // Response mein role bhi bhej rahe hain taake frontend ko pata chale
    res.json({ ...account._doc, role }); //fidbyid sai jodata ata us me hidden coding bhi hoti hai ,aik "Mongoose Document" hota hai jisme bahut saari extra coding hidden hoti hai.Asal data (jo database mein save hai) sirf ._doc ke andar hota hai
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// --- LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // 2. Pehle Admin collection mein dhoondo
    let account = await Admin.findOne({ email });
    let role = 'admin';

    // 3. Agar Admin nahi mila, toh User mein dhoondo
    if (!account) {
      account = await User.findOne({ email });
      role = 'user';
    }

    if (!account) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    // Payload mein role bhi shamil karein
    const payload = { user: { id: account.id, role: role } }; //Payload woh maloomat (data) hoti hai jo hum Token ke andar "Pack" karte hain.baar baar nahi puchna parega ke yeh kaun hai; hum token khol kar dekh lenge ke yeh is ID wala banda hai aur iska role Admin ya User hai.
    //Payload mein password kyun nahi dala?
    //Jawab: Sir, JWT Token "Encrypted" nahi balkay sirf "Encoded" hota hai. Isay koi bhi decode karke parh sakta hai. Isliye hum password jaisi sensitive info kabhi payload mein nahi rakhte, sirf ID aur Role rakhte hain.

    jwt.sign( //ye token generate kr rha hai 
      payload,
      process.env.JWT_SECRET || "mysecrettoken",
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        // Token ke sath user ka basic data aur role wapas bhejein
        res.json({ 
          token,  //token, likha hai lekin aage token: token nahi likha, yeh kyun?
        });
      },
    );
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// --- PROFILE UPDATE ---
router.put('/update', auth, async (req, res) => {
  const { username, email, profilePic } = req.body;
  try {
    // Check in both collections
    let account = await Admin.findById(req.user.id) || await User.findById(req.user.id);
    
    if (!account) return res.status(404).json({ msg: 'Account not found' });

    if (username !== undefined) account.username = username;
    if (email !== undefined) account.email = email;
    if (profilePic !== undefined) account.profilePic = profilePic;

    await account.save();
    
    res.json({ msg: "Profile updated successfully", account });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- REGISTER (Sirf Users ke liye) ---
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ username: name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id, role: 'user' } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || "mysecrettoken",
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      },
    );
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;