# OrcaJá — Guia de Publicação nas Stores

## O que já está pronto ✅

- [x] Frontend React/Vite completo (12 telas)
- [x] Backend Supabase com 8 tabelas e RLS
- [x] Edge Function: aceite digital de OS
- [x] Edge Function: geração de QR Code Pix (estático BACEN)
- [x] Migration: campo pix_key no perfil
- [x] Capacitor configurado (iOS + Android)
- [x] Permissões Android (câmera, notificações, storage)
- [x] Página de Política de Privacidade (/privacidade)
- [x] App name: OrcaJá | Bundle ID: com.orcaja.app

---

## Próximos passos — Android (Google Play)

### Pré-requisitos
- [ ] Android Studio instalado: https://developer.android.com/studio
- [ ] Java 17+ instalado
- [ ] Conta Google Play Console: $25 taxa única → https://play.google.com/console

### Build Android
```bash
# No terminal, dentro da pasta do projeto:
npm run cap:android
# Abre o Android Studio automaticamente
```

### No Android Studio
1. Aguardar Gradle sync (primeira vez demora ~5 min)
2. Menu: **Build → Generate Signed Bundle/APK**
3. Escolher **Android App Bundle (.aab)** — obrigatório para Play Store
4. Criar keystore (guarde o arquivo .jks e as senhas em local seguro!)
5. Gerar o `.aab`

### No Google Play Console
1. Criar novo app → "OrcaJá"
2. Preencher:
   - Categoria: **Produtividade** ou **Negócios**
   - Classificação etária: **LIVRE** (18+ pelo conteúdo comercial)
   - Política de privacidade: `https://[seu-dominio]/privacidade`
3. Adicionar screenshots (mín. 2, ideal 4-8, resolução 1080×1920)
4. Enviar o `.aab`
5. Aprovação: **~3 dias úteis**

---

## Próximos passos — iOS (App Store)

### Pré-requisitos
- [ ] Mac com macOS 13+ (obrigatório para compilar iOS)
- [ ] Xcode 15+ instalado (App Store do Mac, gratuito)
- [ ] Apple Developer Account: $99/ano → https://developer.apple.com/programs/
- [ ] iPhone para teste (ou simulador no Xcode)

### Build iOS (rodar no Mac)
```bash
# Copiar a pasta ios/ para o Mac e executar:
npm run cap:ios
# Abre o Xcode automaticamente
```

### No Xcode
1. Selecionar o target **App**
2. Em **Signing & Capabilities**: selecionar seu Team (conta Apple Developer)
3. Bundle ID: `com.orcaja.app`
4. Menu: **Product → Archive**
5. Na janela Organizer: **Distribute App → App Store Connect**

### Na App Store Connect (appstoreconnect.apple.com)
1. Criar novo app → "OrcaJá"
2. Preencher metadados:
   - **Subtítulo**: Orçamentos, OS e Pix em 1 minuto
   - **Descrição**: (veja texto abaixo)
   - Categoria: **Produtividade**
   - Classificação: **4+**
3. Screenshots: tamanhos obrigatórios: 6.7" (iPhone 15 Pro Max) + 5.5" (iPhone 8 Plus)
4. Política de Privacidade: URL obrigatória
5. Submeter para revisão
6. Aprovação: **~7 dias úteis** (primeira submissão)

---

## Texto para as Lojas

### Título
OrcaJá — Orçamentos e Pix

### Subtítulo / Tagline
Orçamentos, OS e Pix em 1 minuto

### Descrição curta (Google Play)
Crie orçamentos e ordens de serviço profissionais e receba via Pix na hora. Ideal para autônomos e MEIs.

### Descrição completa
OrcaJá é o aplicativo mais rápido para autônomos e microempreendedores gerenciarem seu negócio:

📋 ORÇAMENTOS E ORDENS DE SERVIÇO
• Crie OS completas em menos de 1 minuto
• Adicione itens, valores e descrições
• Envie link de aceite para o cliente assinar digitalmente
• Acompanhe o status: rascunho, enviado, aceito, em andamento, concluído

💸 PIX INTEGRADO
• Gere QR Code Pix automaticamente com o valor da OS
• Cliente escaneia e paga na hora
• Sem taxa, sem intermediário — o dinheiro vai direto para sua conta

👥 GESTÃO DE CLIENTES
• Cadastre clientes com contato completo
• Histórico de OS por cliente

📅 AGENDA
• Organize seus atendimentos e compromissos

💰 FINANCEIRO
• Controle receitas e despesas
• Visão clara do seu faturamento

🧾 FISCAL
• Registro de guias DAS do Simples Nacional

Experimente grátis. Sem complicação.

### Palavras-chave (App Store)
orçamento,ordem de serviço,pix,autonomo,mei,gestão,nota fiscal,cobrança

---

## Deploy da Edge Function Pix no Supabase

```bash
# Instalar Supabase CLI (se não tiver):
npm install -g supabase

# Login:
supabase login

# Deploy da nova função:
supabase functions deploy gerar-pix --project-ref jcqwfcmxridmumhvvjmi

# Aplicar migration do pix_key:
supabase db push --project-ref jcqwfcmxridmumhvvjmi
```

---

## Ícones necessários (criar antes de submeter)

### Android (colocar em android/app/src/main/res/)
- mipmap-mdpi/ic_launcher.png → 48×48
- mipmap-hdpi/ic_launcher.png → 72×72
- mipmap-xhdpi/ic_launcher.png → 96×96
- mipmap-xxhdpi/ic_launcher.png → 144×144
- mipmap-xxxhdpi/ic_launcher.png → 192×192
- Play Store: 512×512 PNG

### iOS (colocar em ios/App/App/Assets.xcassets/AppIcon.appiconset/)
Xcode gera automaticamente a partir de uma imagem 1024×1024.

**Ferramenta gratuita para gerar todos os tamanhos:**
→ https://appicon.co (envie 1024×1024, baixe o pacote)

---

## Checklist final antes de submeter

- [ ] Ícone 1024×1024 criado e adicionado
- [ ] Splash screen criada (fundo roxo #7C3AED com logo)
- [ ] Screenshots capturadas no app (mín. 2 por store)
- [ ] Chave Pix configurada nas instruções de onboarding
- [ ] Edge Function gerar-pix deployada no Supabase
- [ ] Migration pix_key aplicada no Supabase
- [ ] URL da Política de Privacidade publicada
- [ ] Conta Apple Developer ativa (iOS)
- [ ] Conta Google Play Console ativa (Android)
- [ ] Keystore Android gerada e salva com segurança
