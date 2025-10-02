import fs from "fs";
import path from "path";
import sendEmail from "./email.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const renderTemplate = (templateName, variables) => {
  const templatePath = path.join(__dirname, "emailTemplates", templateName);
  let template = fs.readFileSync(templatePath, "utf-8");

  for (let key in variables) {
    template = template.replace(new RegExp(`{{${key}}}`, "g"), variables[key]);
  }
  return template;
};

export const sendTemplateEmail = async ({
  to,
  subject,
  templateName,
  variables,
}) => {
  const htmlContent = renderTemplate(templateName, variables);
  await sendEmail({ to, subject, html: htmlContent });
};
