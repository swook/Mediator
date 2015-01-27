<?php if (!defined('APPLICATION')) exit();

/* Mediator Plugin for Vanilla Forums by Seon-Wook Park | CC BY-NC-SA */

$PluginInfo['Mediator'] = array(
	'Name' => 'Mediator',
	'Description' => 'Allows automatic embedding of media by converting media links to embed code. Supports Youtube, Vimeo, Imgur, Pastebin, Soundcloud [Bandcamp], Gyazo.',
	'Version' => '0.2.16',
	'Date' => '01 Feb 2012',
	'Author' => 'Seon-Wook Park',
	'AuthorEmail' => 'seon.wook@swook.net',
	'AuthorUrl' => 'http://www.swook.net/',
	'RequiredTheme' => FALSE,
	'RequiredPlugins' => FALSE,
	'RegisterPermissions' => FALSE,
	'SettingsPermission' => FALSE,
	'License' => 'CC BY-NC-SA'
);

class MediatorPlugin implements Gdn_IPlugin {

	public function Base_Render_Before(&$Sender) {
		if ($Sender->DeliveryType() == DELIVERY_TYPE_ALL && $Sender->SyndicationMethod == SYNDICATION_NONE) {
			$Sender->AddJsFile('plugins/Mediator/mediator.js');
			$Sender->AddCssFile('plugins/Mediator/design/style.css');
		}
	}

    public function Setup() {
    }
}
