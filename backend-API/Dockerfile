FROM richarvey/nginx-php-fpm:3.1.0

WORKDIR /var/www/html

# Copy the entire project
COPY . .

# Fix permissions for Laravel storage
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Install dependencies, configure Laravel
RUN composer install --no-dev --optimize-autoloader --no-interaction

# The final command to start everything
CMD ["/start.sh"]