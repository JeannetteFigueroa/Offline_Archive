-- Actualizar la contraseña del usuario administrador inicial con el hash válido de BCrypt para "Admin123"
UPDATE usuario
SET password_hash = '$2a$10$r8/4quujp5FPmb27/E3Bd.yOEkHRYViwMYNwHHgY7RjVmbS9pXSHO'
WHERE lower(correo) = 'admin@gmail.com';
