import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1600,height:920}});
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
try{
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.locator('.crm-topbar').waitFor();
 const top=await page.locator('.crm-topbar').boundingBox();
 if(Math.abs(top.x)>1||Math.abs(top.y)>1||Math.abs(top.height-64)>1)throw Error('topbar not flush 64px');
 const toggle=page.getByRole('button',{name:'Communications'});
 await toggle.click();
 await page.locator('.np-panel-open').waitFor();
 const width=await page.locator('.np-root').evaluate(e=>e.getBoundingClientRect().width);
 if(Math.abs(width-480)>2)throw Error('Comms default width wrong: '+width);
 if((await page.locator('.np-device').boundingBox()).width<320)throw Error('Comms not usable');
 await page.locator('.np-panel-resize').focus();
 await page.keyboard.press('ArrowLeft');
 const widened=await page.locator('.np-root').evaluate(e=>e.getBoundingClientRect().width);
 if(widened<=width)throw Error('Panel resizing failed');
 await page.getByRole('button',{name:'Close Communications'}).click();
 await page.waitForTimeout(240);
 if(await page.locator('.np-root').evaluate(e=>e.getBoundingClientRect().width)>1)throw Error('Comms did not close');
 await page.getByRole('button',{name:'User menu'}).click();
 await page.getByRole('menuitem',{name:'Deploy to Vercel'}).waitFor();
 await page.getByRole('button',{name:'User menu'}).click();
 await page.getByRole('button',{name:'Open keypad'}).click();
 if(await page.locator('.crm-topbar-keypad [data-dtmf]').count()!==12)throw Error('Keypad missing keys');
 console.log('v12 focused desktop checks passed');
}finally{await browser.close()}
