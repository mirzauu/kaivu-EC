import { getWhatsAppServiceStatus } from "../src/lib/whatsapp/client";

async function main() {
  console.log("Testing getWhatsAppServiceStatus()...");
  const status = await getWhatsAppServiceStatus();
  console.log("Result:", status);
}

main().catch(console.error);
