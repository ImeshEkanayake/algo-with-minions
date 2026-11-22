export async function selectAlgorithm(page,id){
 const button=page.locator('.category-nav [data-algorithm="'+id+'"], .category-nav [data-tree="'+id+'"]');
 const menuId=await button.evaluate(node=>node.closest('details').id),menu=page.locator('#'+menuId);
 if(!await menu.evaluate(node=>node.open))await menu.locator('summary').click();
 await button.click();
}
export async function activeAlgorithm(page){return page.locator('.category-nav button[aria-current="true"]').evaluate(node=>node.dataset.algorithm||node.dataset.tree);}
export async function algorithmIds(page){return page.locator('.category-nav [aria-current="page"]').evaluate(node=>[...node.closest('details').querySelectorAll('[data-algorithm],[data-tree]')].map(button=>button.dataset.algorithm||button.dataset.tree));}
export async function algorithmCount(page){return (await algorithmIds(page)).length;}
