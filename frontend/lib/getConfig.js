import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export async function getConfig() {
    const configPath = path.join(process.cwd(), "config", "config.yaml");
    const yamlContent = fs.readFileSync(configPath, "utf8");
    const config = yaml.load(yamlContent);

    return config;
}
