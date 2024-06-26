import express from "express";
const router = express.Router();
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { start } from "repl";

router.post("/adminlogin", (req, res) => {
  console.log(req.body);
  const sql = "SELECT * FROM admin WHERE email = ? and password = ?";
  con.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ loginStatus: false, Error: "Query error" });
    } else if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie("token", token);
      return res.json({ loginStatus: true, message: "Login Successfully." });
    } else {
      return res.json({ loginStatus: false, Error: "Wrong email/password" });
    }
  });
});
router.post("/add_category", (req, res) => {
  const sql = "INSERT INTO category (name) VALUES (?)";
  con.query(sql, [req.body.category], (err, result) => {
    console.log(err + " Error");
    console.log(result + "result");
    if (err) {
      console.log(err);
      return res.json({ status: false, Error: "Query error" });
    } else {
      return res.json({ status: true, Error: "Added successfully." });
    }
  });
});

// Start image upload login
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
});
// End Image upload logic

router.get("/category", (req, res) => {
  const sql = "SELECT * FROM category";
  con.query(sql, (err, result) => {
    if (err) {
      return res.json({ status: false, Error: "Query error" });
    } else {
      return res.json({ status: true, Result: result });
    }
  });
});

router.get("/employee", (req, res) => {
  const sql = "SELECT * FROM employee";
  con.query(sql, (err, result) => {
    if (err) {
      return res.json({ status: false, Error: "Query error" });
    } else {
      return res.json({ status: true, Result: result });
    }
  });
});
router.get("/employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee where id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) {
      return res.json({ status: false, Error: "Query error" });
    } else {
      return res.json({ status: true, Result: result });
    }
  });
});

router.post("/add_employee", upload.single("image"), (req, res) => {
  const sql =
    "INSERT INTO employee (name, email, password, category_id, salary, address, image) VALUES (?)";
  bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
    if (err) {
      return res.json({ status: false, Error: hash });
    }
    const values = [
      req.body.name,
      req.body.email,
      hash,
      req.body.category_id,
      req.body.salary,
      req.body.address,
      req.file.filename,
    ];
    con.query(sql, [values], (err, result) => {
      if (err) {
        return res.json({ status: false, message: err });
      } else {
        return res.json({ status: true, message: "Successfully Addedd" });
      }
    });
  });
});

router.put("/edit_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql =
    "UPDATE employee SET name=?, email=?, address=?, salary=?, category_id=? where id = ?";
  const values = [
    req.body.name,
    req.body.email,
    req.body.address,
    req.body.salary,
    req.body.category_id,
  ];
  con.query(sql, [...values, id], (err, result) => {
    if (err) {
      return res.json({ status: false, message: err });
    } else {
      return res.json({ status: true, message: "Successfully Updated" });
    }
  });
});
router.delete("/delete_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM employee where id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) {
      return res.json({ status: false, message: err });
    } else {
      return res.json({ status: true, message: "Successfully Deleted" });
    }
  });
});
router.get("/admin_count", (req, res) => {
  const sql = "SELECT COUNT(id) as total FROM admin";
  con.query(sql, (err, result) => {
    if (err) {
      return res.json({ status: false, message: err });
    } else {
      return res.json({
        status: true,
        message: "Successfully Fetched",
        Result: result,
      });
    }
  });
});
router.get("/employee_count", (req, res) => {
  const sql = "SELECT COUNT(id) as total FROM employee";
  con.query(sql, (err, result) => {
    if (err) {
      return res.json({ status: false, message: err });
    } else {
      return res.json({
        status: true,
        message: "Successfully Fetched",
        Result: result,
      });
    }
  });
});
router.get("/salary_count", (req, res) => {
  const sql = "SELECT SUM(salary) as total FROM employee";
  con.query(sql, (err, result) => {
    if (err) {
      return res.json({ status: false, message: err });
    } else {
      return res.json({
        status: true,
        message: "Successfully Fetched",
        Result: result,
      });
    }
  });
});
router.get("/admins", (req, res) => {
  const sql = "SELECT * FROM admin";
  con.query(sql, (err, result) => {
    if (err) {
      return res.json({ status: false, message: err });
    } else {
      return res.json({
        status: true,
        message: "Successfully Fetched",
        Result: result,
      });
    }
  });
});

export { router as adminRouter };
