FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Серверим build через nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Копируем нашу настроенную конфигурацию nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]