<?php
require 'vendor/autoload.php';


// Setup custom Twig view
$twigView = new \Slim\Extras\Views\Twig();
\Slim\Extras\Views\Twig::$twigTemplateDirs[] = __DIR__.'/templates';


function twig_include_raw(Twig_Environment $env, $template) {
    return $env->getLoader()->getSource($template);
}
$twigView->getEnvironment()->addFunction('include_raw', new Twig_Function_Function('twig_include_raw', array('needs_environment' => true)));


//applying Assetic to twig

// Instantiate application
$app = new \Slim\Slim(array(
    'view' => $twigView,
    'mode' => 'development'
));



$app->em = require_once 'src/doctrine-config.php';

$app->get('/', function () use($app) {
    return $app->render("main.twig");
});

$app->get('/create/wiki', function () use($app) {
    return $app->render("main.twig");
});

$app->get('/wiki/:id', function ($id) use($app) {
    return $app->render("main.twig");
});


//get list of wikiPosts
$app->get('/data/wiki', function () use($app) {
    $query = $app->em->createQuery("SELECT w FROM Entities\WikiPost AS w");
    $return = array();
    foreach ($query->getResult() as $item) {
        $return[] = array("title" => $item->getTitle(),"id" => $item->getId());
    }
    echo json_encode($return);
});

//get one WikiPost by id
$app->get('/data/wiki/:id', function ($id) use($app) {
    $wikiPost = $app->em->find("Entities\WikiPost", (int)$id);//$app->em->getRepository("Entities\WikiPost")->findOneByTitle(str_replace("_", " ", $title));
    if (!$wikiPost) {
        $app->flash('error', 'Login required');
        $app->halt(404,"Not Found wiki post");
    }
    //TODO test is it ajax request only than set josn
    $app->contentType('application/json');
    echo json_encode(array(
        "id" => $wikiPost->getId(),
        "title" => $wikiPost->getTitle(),
        "body" => $wikiPost->getBody()
        )
    );
});


//CREATE NEW POST
$app->post('/data/wiki', function ($id = "default") use($app) {
    $data = json_decode($app->request()->getBody());
    $wikiPost = new \Entities\WikiPost();
    $wikiPost->setTitle($data->title);
    $wikiPost->setBody($data->body);
    $app->em->persist($wikiPost);
    $app->em->flush();
});

$app->put('/wiki/update', function ($id = "default") use($app) {
    $wikiPost = $app->em->find('\Entities\WikiPost', 1);
    print_r($wikiPost->getTitle());
    $wikiPost->setTitle("default");
    $app->em->flush();
    print_r($wikiPost->getTitle());
});


$app->run();