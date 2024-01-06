const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const sequelize = new Sequelize("registermapping", "postgres", "anbu@2023", {
  host: "localhost",
  dialect: "postgres",
});

const User = sequelize.define("User", {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

const UserProfile = sequelize.define("UserProfile", {
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zip: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

User.hasOne(UserProfile);
UserProfile.belongsTo(User);

app.post("/api/register-step1", async (req, res) => {
  try {
    const { firstName, lastName, date, email } = req.body;
    const user = await User.create({
      firstName,
      lastName,
      date,
      email,
    });
    res.status(200).json({ userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/register-step2", async (req, res) => {
  try {
    const { userId, mobileNumber, city, state, zip, userName, password } =
      req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userProfile = await UserProfile.create({
      mobileNumber,
      city,
      state,
      zip,
      userName,
      password,
    });

    await user.setUserProfile(userProfile);

    res.status(200).json({ message: "Registration completed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const userId = 1;

    res.status(200).json({ userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const Tutorial = sequelize.define("tutorial", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  published: {
    type: DataTypes.BOOLEAN,
  },
});

app.post("/api/create", async (req, res) => {
  try {
    if (!req.body.title || !req.body.description) {
      res.status(400).send({
        message: "Title and description are required!",
      });
      return;
    }

    const tutorial = {
      title: req.body.title,
      description: req.body.description,
      published: req.body.published || false,
    };

    const createdTutorial = await Tutorial.create(tutorial);

    res.status(201).send(createdTutorial);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Internal Server Error",
    });
  }
});
app.get("/api/findall", async (req, res) => {
  try {
    const data = await Tutorial.findAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving tutorials.",
    });
  }
});

app.get("/api/findOne/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const data = await Tutorial.findOne({ where: { title: title } });
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cannot find Tutorial with title=${title}.`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving Tutorial with title=" + title,
    });
  }
});

app.delete("/api/deleteAll", async (req, res) => {
  try {
    const nums = await Tutorial.destroy({
      where: {},
      truncate: false,
    });
    res.send({ message: `${nums} Tutorials were deleted successfully!` });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while removing all tutorials.",
    });
  }
});

app.put("/api/update/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const [num] = await Tutorial.update(req.body, {
      where: { id: id },
    });

    if (num == 1) {
      res.send({
        message: "Tutorial was updated successfully.",
      });
    } else {
      res.status(400).send({
        message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating Tutorial with id=" + id,
    });
  }
});

app.delete("/api/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Tutorial.destroy({
      where: { id: id },
    });

    if (num == 1) {
      res.send({
        message: "Tutorial was deleted successfully!",
      });
    } else {
      res.status(400).send({
        message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Could not delete Tutorial with id=" + id,
    });
  }
});

app.get("/api/currentid/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Tutorial.findByPk(id);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving tutorials by id.",
    });
  }
});
sequelize.sync({ force: true }).then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
