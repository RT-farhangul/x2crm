<?php
/**
 * List all models
 * @package X2CRM.modules.newsletters.controllers
 */
class IndexAction extends CAction {

    public function run() {
        $model = new Newsletters('search');
        // Yii::app()->cache->flush();
        $attachments = new CActiveDataProvider('Newsletters', array(
            'criteria'=>array(
                'order'=>'createDate DESC',
                'condition'=>'associationType="newsletters"'
            )
        ));

        $this->getController()->render('index', array(
            'model' => $model,
            'attachments' => $attachments,
        ));
    }
}