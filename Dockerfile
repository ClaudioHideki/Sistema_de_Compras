FROM node:24-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@11.25.0 && pnpm install --prod --frozen-lockfile
COPY *.mjs ./
COPY public ./public
RUN mkdir /data && chown node:node /data
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DATA_DIR=/data
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
