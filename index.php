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
    $app->redirect("/wiki");
});

//get list of wikiPosts
$app->get('/wiki', function () use($app) {
    $query = $app->em->createQuery("SELECT w FROM Entities\WikiPost AS w");
    $return = array();
    foreach ($query->getResult() as $item) {
        $return[] = array("title" => $item->getTitle(),"id" => $item->getId());
    }
    if ($app->request()->isAjax()) {
        $app->contentType('application/json');
        echo json_encode($return);
    } else {
        return $app->render("main.twig");
    }
});//->conditions(array('id' => '\d+','json1312' => '\.json'));

//get one WikiPost by id
$app->get('/wiki/(:title-):id', function ($title, $id) use($app) {
    $wikiPost = $app->em->find("Entities\WikiPost", (int)$id);//$app->em->getRepository("Entities\WikiPost")->findOneByTitle(str_replace("_", " ", $title));
    if (!$wikiPost) {
        $app->flash('error', 'Login required');
        $app->halt(404,"Not Found wiki post");
    }
    //Ends with .json
    if ($app->request()->isAjax()) {
        $app->contentType('application/json');
        echo json_encode(array(
            "id" => $wikiPost->getId(),
            "title" => $wikiPost->getTitle(),
            "body" => $wikiPost->getBody()
            )
        );
    } else {
        return $app->render("main.twig");
    }
});//->conditions(array('id' => '\d+','json1312' => '\.json'));


//CREATE NEW POST
$app->post('/wiki', function () use($app) {
    $data = json_decode($app->request()->getBody());
    $wikiPost = new \Entities\WikiPost();
    $wikiPost->setTitle($data->title);
    $wikiPost->setBody($data->body);
    $app->em->persist($wikiPost);
    $app->em->flush();
    echo json_encode(array( 'id' => $wikiPost->getId() ));
});

//UPDATE POST
$app->put('/wiki/:id', function ($id) use($app) {
    $data = json_decode($app->request()->getBody());
    $wikiPost = $app->em->find('\Entities\WikiPost', (int)$id);
    $wikiPostVersion = new \Entities\WikiPostVersion($wikiPost);
    $app->em->persist($wikiPostVersion);
    $wikiPost->setTitle($data->title);
    $wikiPost->setBody($data->body);
    $app->em->flush();
    echo json_encode(array( 'id' => $wikiPost->getId() ));
});





$app->run();