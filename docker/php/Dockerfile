FROM php:8.4-fpm

ARG WWWUSER=1000
ARG WWWGROUP=1000

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        curl \
        unzip \
        libicu-dev \
        libonig-dev \
        libzip-dev \
    && docker-php-ext-install -j$(nproc) \
        bcmath \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo_mysql \
        zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Match www-data's uid/gid to the host user so files written by php-fpm
# (storage/framework, bootstrap/cache, ...) stay owned by the host user
# on the bind-mounted backend/ directory.
RUN groupmod -g ${WWWGROUP} www-data \
    && usermod -u ${WWWUSER} -g ${WWWGROUP} www-data

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

CMD ["php-fpm"]