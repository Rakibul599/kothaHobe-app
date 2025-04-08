import React from 'react'
import { Link } from 'react-router-dom'

function Notfound() {
  return (
    <div>
      <h1 className='text-2xl'>Not found go to Homepage</h1>
      <button><Link to="/">Home</Link>
      </button>

    </div>
  )
}

export default Notfound
