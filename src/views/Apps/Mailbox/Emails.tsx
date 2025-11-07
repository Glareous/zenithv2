'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { EmailsProps } from '@src/dtos/apps/mail'
import SimpleBar from 'simplebar-react'

const Emails: React.FC<EmailsProps> = ({ filteredEmails, handleShowMail }) => {
  return (
    <React.Fragment>
      <SimpleBar className="-mx-5 h-[35rem]">
        <div className="border-t border-gray-200 divide-y divide-gray-200 dark:border-dark-800 dark:divide-dark-800">
          {filteredEmails.map((email) => (
            <div
              key={'filtered-email-' + email.id}
              className="flex gap-3 p-5 transition duration-300 ease-linear hover:bg-gray-50 dark:hover:bg-dark-850"
              onClick={() => handleShowMail(email)}>
              <div className="self-start mt-3 input-check-group shrink-0"></div>
              <div
                className={`flex items-center justify-center rounded-full ${email.avatarColor ? `${email.avatarColor}` : 'bg-red-500/10'} shrink-0 size-10`}>
                {email.avatarImage ? (
                  <Image
                    src={email.avatarImage}
                    alt={email.sender}
                    className="rounded-full"
                    width={40}
                    height={40}
                  />
                ) : (
                  <span className="text-red-500">{email.avatarText}</span>
                )}
              </div>
              <div className="overflow-hidden grow">
                <p className="float-end text-sm">
                  {email.date}
                  {/* Add additional formatting if needed */}
                </p>
                <h6 className="mb-1">{email.sender}</h6>
                <Link
                  href={`mailto:${email.email}`}
                  className="link link-primary">
                  {email.email}
                </Link>
                <Link href="#!" className="block mt-3">
                  <h6 className="mb-1">{email.subject}</h6>
                  <p className="truncate">{email.message}</p>
                </Link>
                <div className="flex justify-end gap-2 mt-2">
                  {email.badges.map((badge: string, index: number) => (
                    <span
                      key={index}
                      className={`badge ${
                        badge === 'Application' ||
                        badge === 'Scheduled' ||
                        badge === 'Important'
                          ? 'badge-green'
                          : badge === 'Inbox' || badge === 'Drafts'
                            ? 'badge-gray'
                            : badge === 'Developers'
                              ? 'badge-yellow'
                              : badge === 'Photographer'
                                ? 'badge-sky'
                                : 'badge-red'
                      }`}>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SimpleBar>
    </React.Fragment>
  )
}

export default Emails
