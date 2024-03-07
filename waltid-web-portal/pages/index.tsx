import CustomCredentialModal from '@/components/walt/modal/CustomCredentialModal';
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Credential from '@/components/walt/credential/Credential';
import { AvailableCredential } from '@/types/credentials';
import Button from '@/components/walt/button/Button';
import { CredentialsContext } from '@/pages/_app';
import { Inter } from 'next/font/google';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import WaltIcon from '@/components/walt/logo/WaltIcon';

const inter = Inter({ subsets: ['latin'] });

// Mock data for AvailableCredentials
const mockAvailableCredentials = [
  {
    id: '1',
    title: 'Credential A',
    description: 'Description of Credential A',
    selected: false, // Initially not selected
  },
  {
    id: '2',
    title: 'Credential B',
    description: 'Description of Credential B',
    selected: false, // Initially not selected
  },
  // Add more mock credentials as needed
];

type CredentialToIssue = AvailableCredential & {
  selected: boolean;
};

export default function Home() {
  const [AvailableCredentials] = React.useContext(CredentialsContext);
  const router = useRouter();

  const [credentialsToIssue, setCredentialsToIssue] = useState<CredentialToIssue[]>(prepareCredentialsToIssue);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);

  const showButton = credentialsToIssue.some((cred) => cred.selected);
  const credentials = !searchTerm ? credentialsToIssue : credentialsToIssue.filter(credential => {
    return credential.title.toLowerCase().includes(searchTerm.toLowerCase());
  })

  function prepareCredentialsToIssue(): CredentialToIssue[] {
    return AvailableCredentials.map((cred: AvailableCredential) => {
      return {
        ...cred,
        selected: false,
      };
    });
  }

  React.useEffect(() => {
    setCredentialsToIssue(prepareCredentialsToIssue);
  }, [AvailableCredentials]);

  function getIdsForCredentialsToIssue() {
    const ids: string[] = [];
    credentialsToIssue.forEach((cred) => {
      if (cred.selected) {
        ids.push(cred.id);
      }
    });

    return ids;
  }

  function handleCredentialSelect(id: string) {
    const updatedCreds = credentialsToIssue.map((cred) => {
      if (cred.id === id) {
        return {
          ...cred,
          selected: !cred.selected,
        };
      } else {
        return cred;
      }
    });

    setCredentialsToIssue(updatedCreds);
  }

  function handleStartIssuance() {
    const idsToIssue = getIdsForCredentialsToIssue();

    const params = new URLSearchParams();
    params.append('ids', idsToIssue.join(','));

    router.push(`/credentials?${params.toString()}`);
  }

  function handleSearchTermChange(e: any) {
    const value = e.target.value;
    setSearchTerm(value);
  }

  return (
    <div>
      <div className="flex flex-col justify-center items-center mt-10">
        <div className="flex flex-row justify-between items-center space-x-20 w-full max-w-4xl px-5">
          <h1 className="text-4xl font-bold text-primary-900">
            InfoCert (Q)EAA Portal
          </h1>
          <div className='flex flex-row gap-5'>
            <div className='flex flex-row border-b border-b-1 border-gray-200 items-center' style={{ flexGrow: 1 }}>
              <MagnifyingGlassIcon className='h-6 text-gray-500' />
              <input
                type="text"
                className='w-full border-none outline-none focus:ring-0 bg-gray-50'
                onChange={handleSearchTermChange}
                placeholder="Search credential..."
              />
            </div>
            <Button size='sm' onClick={() => { setModalVisible(true); }}>Custom Credential</Button>
          </div>
        </div>
        <div style={{ marginBottom: -70 }}>
          <div className="flex flex-col items-center mt-10">
            <div className="text-center max-w-4xl px-5">
              <p className="text-lg text-primary-900">
                Below, you'll find a comprehensive list of available (Q)EAAs that can be issued or verified. Utilize the search bar above to quickly find credentials by name. If you have specific requirements or need to issue credentials manually, you can do so by using a JSON format through the "Custom Credential" option. Explore the options below to select and manage the credentials according to your needs.
              </p>
            </div>
          </div>        </div>
      </div>
      <main className="flex flex-col items-center gap-5 justify-between mt-16 md:w-[740px] m-auto">
        {credentials.length === 0 && <div className='w-full mt-10 text-center'>No Credentials to show.</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-5 mt-10">
          {credentials.map(({ id, title, selected }) => (
            <Credential
              id={id}
              title={title}
              selected={selected}
              onClick={handleCredentialSelect}
              key={id}
            />
          ))}
        </div>
      </main>
      <Button
        className={`transition-all duration-700 ease-in-out fixed ${!showButton && '-translate-y-20'
          } top-5 right-5 left-0`}
        size="lg"
        onClick={handleStartIssuance}
      >
        Start
      </Button>
      <CustomCredentialModal show={modalVisible} onClose={() => { setModalVisible(!modalVisible) }} />
    </div>
  );
}
