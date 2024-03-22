import { readFile, writeFile } from "fs/promises";
import axios from "axios";

// Function to read a JSON file and extract the specified property
async function setSession(data) {
  try {
    // Read the contents of the file
    await writeFile("session-lock.json", JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error(
      `Error reading user details from session file: ${error.message}`
    );
  }
}

// Function to read a JSON file and extract the specified property
async function getUser() {
  try {
    // Read the contents of the file
    const fileContent = await readFile("session-lock.json", "utf-8");

    // Parse the JSON content into an object
    const jsonData = JSON.parse(fileContent);

    // Extract the specified property
    return jsonData["user"];
  } catch (error) {
    throw new Error(
      `Error reading user details from session file: ${error.message}`
    );
  }
}

// Function to read a JSON file and extract the name property
async function getBearerToken() {
  try {
    // Read the contents of the file
    const fileContent = await readFile("session-lock.json", "utf-8");

    // Parse the JSON content into an object
    const jsonData = JSON.parse(fileContent);

    // Extract the specified property
    return jsonData["authorization"]["token"];
  } catch (error) {
    throw new Error(
      `Error reading bearer token from session file: ${error.message}`
    );
  }
}

async function postWithToken(url, data = {}) {
  try {
    const response = await axios.post(`${process.env.BASE_URL}/${url}`, data, {
      headers: {
        Authorization: `Bearer ${await getBearerToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response.data.status === "error") {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(error.message);
    }
  }
}

// Export the functions
export { setSession, getUser, getBearerToken, postWithToken };
