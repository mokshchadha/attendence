const { test, expect } = require('@playwright/test');
const fs = require('fs');
require('dotenv').config();

const USER = process.env.HR_USER
const PASSWORD = process.env.HR_PASSWORD

test('Open GreyTHR website, login, and find Sign Out button', async ({ page }) => {
  await page.goto('https://pipin.greythr.com/');

  await page.waitForLoadState('networkidle');
  
  const userNameInput = page.locator('#username');
  await userNameInput.waitFor({ state: 'visible' });
  await userNameInput.fill(USER);
  
  const passwordInput = page.locator('#password');
  await passwordInput.fill(PASSWORD);
  
  const loginButton = page.locator('xpath=/html/body/app-root/uas-portal/div/div/main/div/section/div[1]/o-auth/section/div/app-login/section/div/div/div/form/button');
  await loginButton.click();
  
  await page.waitForURL('**/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(10000);


  const findButtonInShadowDOM = async (element) => {
    const button = await element.evaluateHandle((el) => {
      function searchShadowDOM(root) {
        if (root.shadowRoot) {
          const button = root.shadowRoot.querySelector('button.btn.btn-primary.btn-medium');
          if (button && (button.textContent.trim() === 'Sign Out' || button.textContent.trim() === 'Sign In')) {
            return button;
          }
          for (const child of root.shadowRoot.children) {
            const result = searchShadowDOM(child);
            if (result) return result;
          }
        }
        for (const child of root.children) {
          const result = searchShadowDOM(child);
          if (result) return result;
        }
        return null;
      }
      return searchShadowDOM(el);
    });
    return button.asElement();
  };

  const signButton = await findButtonInShadowDOM(page.locator('body'));

  if (signButton) {
    console.log('Button found in shadow DOM');
    const buttonText = await signButton.textContent();
    console.log(`Button text: ${buttonText}`);
    await signButton.screenshot({ path: 'button_found_in_shadow_dom.png' });
    
    await signButton.click();
    console.log('Button clicked');
  } else {
    console.log('Button not found in shadow DOM');
  }

  // Log the shadow DOM structure
  const shadowDOMStructure = await page.evaluate(() => {
    function getStructure(root, depth = 0) {
      let structure = '';
      const indent = '  '.repeat(depth);
      structure += `${indent}${root.tagName}${root.id ? `#${root.id}` : ''}${root.className ? `.${root.className.replace(/\s+/g, '.')}` : ''}\n`;
      
      if (root.shadowRoot) {
        structure += `${indent}  #shadow-root\n`;
        for (const child of root.shadowRoot.children) {
          structure += getStructure(child, depth + 2);
        }
      }
      
      for (const child of root.children) {
        structure += getStructure(child, depth + 1);
      }
      
      return structure;
    }
    return getStructure(document.body);
  });
  
  fs.writeFileSync('shadow_dom_structure.txt', shadowDOMStructure);
  console.log('Saved shadow DOM structure to shadow_dom_structure.txt');
});