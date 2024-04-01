import { readdir, stat, readFile, writeFile } from "fs/promises";
import md5File from "md5-file";
import axios from "axios";
import { join, basename, dirname } from "path";

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
async function updateProject(ProjectSlug = null) {
  try {
    const response = await postWithToken("v1/user/projects", {
      project: ProjectSlug,
    });
    // Read the contents of the file
    await writeFile(
      "project-lock.json",
      JSON.stringify(response.data, null, 2)
    );

    if (ProjectSlug === null) return response.data;

    const projectTwoData = response.data.find((project) =>
      project.hasOwnProperty(ProjectSlug)
    );

    // Extract the specified property
    return projectTwoData;

    return response.data;
  } catch (error) {
    throw new Error(
      `Error reading user details from session file: ${error.message}`
    );
  }
}

// Function to read a JSON file and extract the specified property
async function getProject(ProjectSlug = null) {
  try {
    // Read the contents of the file
    const fileContent = await readFile("project-lock.json", "utf-8");

    // Parse the JSON content into an object
    const jsonData = JSON.parse(fileContent);

    if (ProjectSlug === null) return jsonData;

    const projectTwoData = jsonData.find((project) =>
      project.hasOwnProperty(ProjectSlug)
    );

    // Extract the specified property
    return projectTwoData;
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
    console.log(error);
    if (error.response.data.status === "error") {
      throw new Error(error.response.data.message);
    } else {
      throw new Error(error.message);
    }
  }
}

async function postModuleApp(url, data = {}, token = "") {
  try {
    const response = await axios.post(`${url}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
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

async function postModuleAppDownload(url, data = {}, token = "") {
  try {
    const response = await axios.post(`${url}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
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

async function filterFilesByExtension(files, extensions) {
  return files.filter((file) => {
    const fileExtension = file.split(".").pop(); // Get the file extension
    return !extensions.includes(fileExtension); // Check if the extension is not in the list
  });
}

// Recursive function to get all files in a directory and its subdirectories
async function getAllFiles(directory) {
  let files = [];

  // Read the contents of the directory
  const entries = await readdir(directory);

  // Iterate over the entries in the directory
  for (const entry of entries) {
    // Get the full path of the entry
    const fullPath = join(directory, entry);

    // Get the stats of the entry
    const stats = await stat(fullPath);

    // If the entry is a directory, recursively get its files
    if (stats.isDirectory()) {
      const subDirectoryFiles = await getAllFiles(fullPath);
      files = files.concat(subDirectoryFiles);
    } else {
      // If the entry is a file, add it to the list of files
      files.push(fullPath);
    }
  }

  return files;
}

async function getFileHash(filePath) {
  // Calculate and return the MD5 hash of the file content
  const fileHash = await md5File(filePath);
  return fileHash;
}

// Export the functions
export {
  setSession,
  updateProject,
  getProject,
  getUser,
  getBearerToken,
  postWithToken,
  postModuleApp,
  filterFilesByExtension,
  postModuleAppDownload,
  getAllFiles,
  getFileHash,
};
