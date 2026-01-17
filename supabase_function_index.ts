
/**
 * SUPABASE EDGE FUNCTION : send-confirmation-email
 * 
 * INSTRUCTIONS POUR LE DÉPLOIEMENT :
 * 1. Créez une nouvelle Edge Function dans Supabase nommée 'send-confirmation-email'.
 * 2. Copiez ce code dans le fichier 'index.ts' de la fonction.
 * 3. Les clés sont récupérées via Deno.env.get() depuis les secrets que vous avez configurés :
 *    MJ_APIKEY_PUBLIC=01141e4b8a1381e3596d99c5d9404953
 *    MJ_APIKEY_PRIVATE=260b747f0583adbd78592455dec1dac0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MAILJET_API_URL = "https://api.mailjet.com/v3.1/send";

serve(async (req) => {
  // Gestion du CORS pour permettre les appels depuis le navigateur
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Methods': 'POST', 
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' 
      } 
    })
  }

  try {
    const { email, firstName, lastName, faculty, department } = await req.json();

    // Récupération sécurisée des clés depuis le Vault Supabase (Environment Variables)
    // On utilise les noms exacts fournis : MJ_APIKEY_PUBLIC et MJ_APIKEY_PRIVATE
    // Fix: Access Deno through globalThis to resolve the "Cannot find name 'Deno'" error in strict TypeScript environments.
    const apiKey = (globalThis as any).Deno.env.get("MJ_APIKEY_PUBLIC") || "01141e4b8a1381e3596d99c5d9404953";
    const secretKey = (globalThis as any).Deno.env.get("MJ_APIKEY_PRIVATE") || "260b747f0583adbd78592455dec1dac0";
    
    if (!apiKey || !secretKey) {
      throw new Error("Clés API Mailjet manquantes dans la configuration du serveur.");
    }

    const authHeader = btoa(`${apiKey}:${secretKey}`);

    const payload = {
      Messages: [
        {
          From: {
            Email: "jacquesmasuruku2@gmail.com",
            Name: "Université Polytechnique de Goma (UPG)"
          },
          To: [
            {
              Email: email,
              Name: `${firstName} ${lastName}`
            }
          ],
          Subject: "Confirmation de votre pré-inscription à l'UPG",
          HTMLPart: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #002B5B; border-radius: 12px; overflow: hidden shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background-color: #002B5B; padding: 30px; text-align: center;">
                <h1 style="color: #D4AF37; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Bienvenue à l'UPG</h1>
              </div>
              <div style="padding: 30px; background-color: #ffffff;">
                <p style="font-size: 16px; color: #333;">Bonjour <strong>${firstName} ${lastName}</strong>,</p>
                <p style="font-size: 15px; color: #555; line-height: 1.6;">Nous avons le plaisir de vous confirmer la réception de votre dossier de pré-inscription en ligne.</p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #D4AF37; padding: 20px; margin: 25px 0;">
                  <p style="margin: 0; font-size: 14px; color: #002B5B;"><strong>Domaine :</strong> ${faculty}</p>
                  <p style="margin: 5px 0 0 0; font-size: 14px; color: #002B5B;"><strong>Filière :</strong> ${department}</p>
                </div>

                <p style="font-size: 14px; color: #666; line-height: 1.5;">
                  Votre candidature est actuellement en cours d'examen par notre commission académique. 
                  Un agent de l'apparitorat prendra contact avec vous via votre numéro de téléphone ou cet email pour la suite de la procédure.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                  <p style="font-size: 13px; color: #888; margin-bottom: 5px;">Besoin d'aide ?</p>
                  <p style="font-size: 14px; color: #002B5B; font-weight: bold; margin: 0;">Contactez-nous au +243 973 380 118</p>
                </div>
              </div>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
                Université Polytechnique de Goma • Excellence & Innovation
              </div>
            </div>
          `
        }
      ]
    };

    const response = await fetch(MAILJET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authHeader}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*' 
        } 
      }
    );

  } catch (error: any) {
    // Fix: Explicitly type the error as any to safely access its properties in the catch block.
    console.error("Erreur Edge Function Email:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*' 
        } 
      }
    );
  }
})
