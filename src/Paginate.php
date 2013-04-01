<?php
// FORM http://docs.doctrine-project.org/en/2.0.x/cookbook/dql-custom-walkers.html
class Paginate
{
    static public function count(Query $query)
    {
        /* @var $countQuery Query */
        $countQuery = clone $query;

        $countQuery->setHint(Query::HINT_CUSTOM_TREE_WALKERS, array('DoctrineExtensions\Paginate\CountSqlWalker'));
        $countQuery->setFirstResult(null)->setMaxResults(null);

        return $countQuery->getSingleScalarResult();
    }
}