module.exports = async (
  page,
  account,
  group = {
    name: "đồ chơi an toàn",
    link: "https://www.facebook.com/groups/397307134307368/"
  }
) => {
  console.log("group: ", group);
  const url = await page.url();
  if (!url.includes("https://www.facebook.com")) {
    try {
      await page.goto("https://www.facebook.com/profile.php");
    } catch (error) {}
  }
  if (group == undefined) {
    group = {
      name: "đồ chơi an toàn",
      link: "https://www.facebook.com/groups/397307134307368/"
    };
  }
  try {
    const searchSelector =
      'div.navigationFocus.textInput input[data-testid="search_input"]';
    try {
      await page.waitFor(searchSelector, { timeout: 10000, visible: true });
    } catch (error) {
      console.log("da co loi", error);
    }
    try {
      await page.focus(searchSelector);
    } catch (error) {
      console.log("da co loi", error);
    }
    await page.waitFor(1200);
    await page.type(`${searchSelector}`, `  ${group.name}`, { delay: 110 });
    await page.waitFor(1200);
    await page.keyboard.press("Enter", { delay: 100 });
    try {
      await page.waitForNavigation({ timeout: 10000 });
    } catch (error) {}
    const groupBtn = 'li[data-edge="keywords_groups"] a';
    try {
      await page.waitFor(groupBtn, { timeout: 10000, visible: true });
    } catch (error) {
      console.log("da co loi", error);
    }
    await page.waitFor(800);
    await page.click(groupBtn);
    let link = group.link;
    if (link.includes("https://www.facebook.com")) {
      link = link.replace("https://www.facebook.com", "");
    }
    if (!link.includes("/groups")) {
      link = "/" + link;
    }
    console.log("đang tìm nhóm có liên kết: ", link);
    let idGroup = link.replace("/groups/", "");
    console.log("idGroup = ", idGroup);
    idGroup = idGroup.replace(`/`, "");
    console.log("idGroup = ", idGroup);
    let jointBtn = `#joinButton_${idGroup}`;
    console.log("jointBtn = ", jointBtn);
    const targetGroup = `#browse_result_area [data-testid="browse-result-content"] a[href="${link}?ref=br_rs"]`;
    let isfoundGroup = true;
    try {
      await page.waitFor(targetGroup, { timeout: 10000, visible: true });
    } catch (error) {
      console.log("không tìm thấy nhóm");
      console.log("da co loi", error);
      isfoundGroup = false;
    }
    if (isfoundGroup) {
      await page.waitFor(800);
      try {
        await page.focus(targetGroup);
      } catch (error) {
        console.log("da co loi", error);
      }
      try {
        await page.click(targetGroup);
        try {
          await page.waitForNavigation({ timeout: 20000 });
        } catch (error) {
          console.log("da co loi", error);
        }
      } catch (error) {}
    } else {
      await page.goto(group.link);
    }

    try {
      await page.waitFor(jointBtn, { timeout: 10000, visible: true });
    } catch (error) {
      console.log("da co loi", error);
    }
    await page.waitFor(1000);
    await page.click(jointBtn);
  } catch (error) {}
};
