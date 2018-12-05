import chalk from 'chalk'
import * as inquirer from 'inquirer'
import * as clear from 'clear'
import { Spinner } from 'clui'
import { getStory, getLatest } from 'node-medium-feed'

let username

function getUsername () {
  const questions = [
    {
      name: 'username',
      type: 'text',
      message: 'Enter the medium username:',
      validate: (value) => {
        if (value.length) {
          return true
        } else {
          return 'Please enter a username.'
        }
      }
    }
  ]

  return inquirer.prompt(questions)
}

function opts () {
  const questions = [
    {
      name: 'action',
      type: 'list',
      choices: [
        'Get Story',
        'Get Latest From Publication'
      ]
    }
  ]

  return inquirer.prompt(questions)
}

function getStoryId () {
  const questions = [
    {
      name: 'storyId',
      type: 'text',
      message: 'Enter the StoryId:',
      validate: (value) => {
        if (value.length) {
          return true
        } else {
          return 'Please enter a storyId.'
        }
      }
    }
  ]

  return inquirer.prompt(questions)
}

function end () {
  const questions = [
    {
      name: 'end',
      type: 'text',
      message: 'Press enter to end',
    }
  ]

  return inquirer.prompt(questions)
}

function latestOpts (latest) {
  const questions = [
    {
      name: 'storyId',
      type: 'list',
      message: `Found the following latest stories from ${username}:`,
      choices: latest.posts.map(p => { 
        return { name: p.title, value: p.uniqueSlug }
      })
    }
  ]

  return inquirer.prompt(questions)
}

async function storyLoop (storyId) {
  if (!storyId) {
    storyId = (await getStoryId()).storyId
  }
  const status = new Spinner('Fetching medium story..')
  status.start()
  const story = await getStory(username, storyId)
  status.stop()
  console.log(chalk.blueBright(story.content.toMarkdown()))
}

async function publicationLoop () {
  const status = new Spinner(`Fetching latest feed from '${username}'..`)
  status.start()
  const latest = await getLatest(username)
  status.stop()
  const storyId = (await latestOpts(latest)).storyId
  await storyLoop(storyId)
}

const run = async() => {
  clear()
  console.log(chalk.blueBright(''))
  username = (await getUsername()).username

  const opt = await opts()

  if (opt.action == 'Get Story') {
    await storyLoop(null)
  } else {
    await publicationLoop()
  }

  await end()
}

run()