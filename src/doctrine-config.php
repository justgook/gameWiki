<?php
// bootstrap.php
require __DIR__.'/../vendor/autoload.php';

use Doctrine\ORM\Tools\Setup;
use Doctrine\ORM\EntityManager;

$paths = array(__DIR__."/Entities");
$isDevMode = false;

// the connection configuration
$dbParams = array(
    'driver'   => 'pdo_mysql',
    'user'     => 'user',
    'password' => 'password',
    'dbname'   => 'database_name',
);

$config = Setup::createAnnotationMetadataConfiguration($paths, $isDevMode);
$classLoader = new \Doctrine\Common\ClassLoader('Entities', __DIR__ , 'loadClass');
$classLoader->register();
return EntityManager::create($dbParams, $config);