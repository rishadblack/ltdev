import { program } from "commander";
import axios from "axios";
import { writeFile } from "fs/promises";
import inquirer from "inquirer";

const loginCommand = program
  .command("login")
  .description("Log in and store authentication token")
  .action(async () => {
    try {
      // Prompt for username and password
      const credentials = await inquirer.prompt([
        {
          type: "input",
          name: "username",
          message: "Enter your username:",
        },
        {
          type: "password",
          name: "password",
          message: "Enter your password:",
        },
      ]);

      console.log(credentials.username, credentials.password);

      // Make a POST request to the login endpoint
      const response = await axios.post("https://xyz.com/api/login", {
        username: credentials.username,
        password: credentials.password,
      });

      // Check if the login was successful and store the token
      if (response.data && response.data.token) {
        const token = response.data.token;
        // Store the token securely (you can use environment variables or a config file)
        await writeFile("auth-token.txt", token);
        console.log("Login successful. Token stored.");
      } else {
        console.error("Login failed. Invalid response from the server.");
      }
    } catch (error) {
      console.error("Login failed. Error:", error.message);
    }
  });

export default loginCommand;
