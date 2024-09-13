# Use uma imagem oficial do Node.js como base
FROM node:18

# Crie e defina o diretório de trabalho no contêiner
WORKDIR /Project-Blog

# Copie o arquivo package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências do aplicativo

RUN npm install

# Copie o restante do código-fonte para o diretório de trabalho
COPY . .

# Exponha a porta em que a aplicação estará ouvindo
EXPOSE 3333

# Defina o comando para iniciar a aplicação
CMD ["node", "Project-Blog/app.js"]