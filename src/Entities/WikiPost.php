<?php
namespace Entities;
/**
 * @Entity
 * @HasLifeCycleCallbacks
 * @generatedValue(strategy="AUTO")
 */
class WikiPost
{
    /**
     * @Id
     * @Column(type="integer")
     * @generatedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @Column(type="string", unique=true)
     */
    private $title;

    /**
     * @Column(type="text")
     */
    private $body;

    /**
     * @Column(type="integer")
     * @version
     */
    private $version = 0;

    /**
     * @OneToMany(targetEntity="WikiPostVersion", mappedBy="post", cascade={"all"})
     */
    private $auditLog = array();

    /**
     * @PreUpdate
     */
    public function logVersion()
    {
        echo "<br>WikiPost::logVersion";
        print_r(count($this->auditLog));
        echo "<br>";

        $this->auditLog[] = new WikiPostVersion($this);
        print_r(count($this->auditLog));
        echo "<br>";
// die;
        // echo "<br>";
        // print_r($this->auditLog[0]->getTitle());
        // echo "<br>";
        // die("dasdasdsa");
        // print_r(count($this->auditLog));
    }

    public function getId(){
        return $this->id;
    }
    public function setTitle($title) {
        $this->title = $title;
        return $this;
    }

    public function getTitle() {
        return $this->title;
    }

    public function setBody($body) {
        $this->body = $body;
        return $this;
    }

    public function getBody() {
        return $this->body;
    }

    public function getCurrentVersion (){
        return $this->version;
    }

    public function setVersion ($version) {
        $this->version = $version;
    }
}

/**
 * @Entity
 */
class WikiPostVersion
{
    /**
     * @Id
     * @Column(type="integer")
     * @generatedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @Column(type="string")
     */
    private $title;

    /**
     * @Column(type="text")
     */
    private $body;

    /**
     * @Column(type="integer")
     */
    private $version;

    /**
     * @ManyToOne(targetEntity="WikiPost")
     */
    private $post;

    public function __construct(WikiPost $post)
    {
        $this->post = $post;
        $this->title = $post->getTitle();
        $this->body = $post->getBody();
        $this->version = $post->getCurrentVersion();
    }

    public function getTitle() {
        return $this->title;
    }
}