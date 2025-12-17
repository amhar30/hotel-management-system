#!/usr/bin/env bash
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Only run migrations if you're ready for production data
# php artisan migrate --force