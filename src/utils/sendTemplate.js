import fs from "fs";
import path from "path";
import sendEmail from "./email.js"; 

const renderTemplate = (templateName, variables) => {
  let template = fs.readFileSync(path.join(process.cwd(), "utils/emailTemplates", templateName), "utf-8");
  for (let key in variables) {
    template = template.replace(new RegExp(`{{${key}}}`, "g"), variables[key]);
  }
  return template;
};

export const sendTemplateEmail = async ({ to, subject, templateName, variables }) => {
  const htmlContent = renderTemplate(templateName, variables);
  await sendEmail({ to, subject, html: htmlContent });
};
