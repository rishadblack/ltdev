<?php

namespace Modules\Blog\Pages;

use Livewire\Attributes\Layout;
use Livewire\Component;

#[Layout('theme::layouts.master')]
class Test extends Component
{
    public $count;

    public function increment()
    {
        $this->count++;
    }

    public function render()
    {
        return view('blog::pages.test');
    }
}
